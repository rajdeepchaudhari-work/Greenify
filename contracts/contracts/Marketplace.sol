// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  Marketplace
/// @author Rajdeep Chaudhari (Greenify)
/// @notice Escrowed ERC-1155 marketplace for carbon credits with a capped
///         protocol fee. Sellers deposit credits into the contract on
///         {list}; buyers pay in ETH on {buy} and the contract atomically
///         transfers the credits, pays the seller, takes the fee, and
///         refunds any overpayment.
/// @dev    Inherits {ERC1155Holder} to receive ERC-1155 safeTransferFroms,
///         {ReentrancyGuard} for buy/cancel, and {Ownable} for fee config.
contract Marketplace is ERC1155Holder, ReentrancyGuard, Ownable {
    /// @notice On-chain listing record.
    /// @param seller       Owner of the listing; receives sale proceeds.
    /// @param projectId    tokenId of the credit being sold.
    /// @param amount       Remaining credits available in this listing.
    /// @param pricePerUnit Wei price per single credit.
    /// @param active       Whether the listing is currently fillable.
    struct Listing {
        address seller;
        uint256 projectId;
        uint256 amount;
        uint256 pricePerUnit;
        bool active;
    }

    /// @notice ERC-1155 credit token this marketplace escrows and trades.
    IERC1155 public immutable credits;

    /// @notice Address that receives the protocol fee portion of every sale.
    address public feeRecipient;

    /// @notice Protocol fee in basis points (10_000 = 100%). Hard-capped at 1000 (10%).
    uint96 public feeBps;

    /// @notice Monotonically increasing id assigned to each new listing.
    uint256 public nextListingId;

    /// @notice Public lookup of listing state by id.
    mapping(uint256 => Listing) public listings;

    /// @notice Emitted on successful {list}.
    event Listed(
        uint256 indexed id,
        address indexed seller,
        uint256 indexed projectId,
        uint256 amount,
        uint256 pricePerUnit
    );

    /// @notice Emitted on partial or full {buy}.
    event Sold(uint256 indexed id, address indexed buyer, uint256 amount, uint256 totalPaid);

    /// @notice Emitted on {cancel} — seller reclaims remaining credits.
    event Cancelled(uint256 indexed id);

    /// @notice Emitted on fee config change by the owner.
    event FeeUpdated(uint96 newFeeBps, address newRecipient);

    /// @notice Thrown when a non-seller attempts to cancel a listing.
    error NotSeller();
    /// @notice Thrown when operating on a listing that is not currently active.
    error ListingInactive();
    /// @notice Thrown when requesting more units than the listing has available.
    error NotEnoughAvailable();
    /// @notice Thrown when msg.value is less than amount * pricePerUnit.
    error InsufficientPayment();
    /// @notice Thrown when an ETH payout to the seller/fee recipient/buyer fails.
    error TransferFailed();
    /// @notice Thrown when trying to set a fee higher than the 10% cap.
    error InvalidFee();

    /// @notice Deploy the marketplace.
    /// @param  creditsAddr   Address of the deployed ERC-1155 credit token.
    /// @param  admin         Initial owner (fee config authority).
    /// @param  feeRecipient_ Address that receives fees.
    /// @param  feeBps_       Initial fee in basis points (max 1000 = 10%).
    constructor(address creditsAddr, address admin, address feeRecipient_, uint96 feeBps_) Ownable(admin) {
        if (feeBps_ > 1000) revert InvalidFee();
        credits = IERC1155(creditsAddr);
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    /// @notice Update the fee percentage and recipient.
    /// @dev    Owner-only. Capped at 1000 bps (10%) to protect users.
    /// @param  newFeeBps    New fee in basis points.
    /// @param  newRecipient New fee recipient address.
    function setFee(uint96 newFeeBps, address newRecipient) external onlyOwner {
        if (newFeeBps > 1000) revert InvalidFee();
        feeBps = newFeeBps;
        feeRecipient = newRecipient;
        emit FeeUpdated(newFeeBps, newRecipient);
    }

    /// @notice Create a new listing.
    /// @dev    Seller must have pre-approved this contract on the ERC-1155
    ///         token (`setApprovalForAll`). Credits are escrowed into the
    ///         contract immediately.
    /// @param  projectId    tokenId of the credit to sell.
    /// @param  amount       Number of credits to list.
    /// @param  pricePerUnit Wei price per single credit.
    /// @return id           Newly assigned listing id.
    function list(uint256 projectId, uint256 amount, uint256 pricePerUnit) external returns (uint256 id) {
        id = nextListingId++;
        listings[id] = Listing({
            seller: msg.sender,
            projectId: projectId,
            amount: amount,
            pricePerUnit: pricePerUnit,
            active: true
        });
        credits.safeTransferFrom(msg.sender, address(this), projectId, amount, "");
        emit Listed(id, msg.sender, projectId, amount, pricePerUnit);
    }

    /// @notice Cancel a listing and return remaining credits to the seller.
    /// @dev    Only the seller can cancel. Protected by {ReentrancyGuard}.
    /// @param  id Listing id to cancel.
    function cancel(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert ListingInactive();
        if (l.seller != msg.sender) revert NotSeller();
        l.active = false;
        uint256 remaining = l.amount;
        l.amount = 0;
        credits.safeTransferFrom(address(this), msg.sender, l.projectId, remaining, "");
        emit Cancelled(id);
    }

    /// @notice Purchase `amount` credits from listing `id`.
    /// @dev    State is updated BEFORE external calls (checks-effects-interactions).
    ///         Credits are transferred first, then seller is paid, then fee,
    ///         then any overpayment is refunded. Protected by {ReentrancyGuard}.
    /// @param  id     Listing id to buy from.
    /// @param  amount Number of credits to purchase.
    function buy(uint256 id, uint256 amount) external payable nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert ListingInactive();
        if (amount == 0 || amount > l.amount) revert NotEnoughAvailable();

        uint256 total = amount * l.pricePerUnit;
        if (msg.value < total) revert InsufficientPayment();

        uint256 fee = (total * feeBps) / 10_000;
        uint256 sellerProceeds = total - fee;

        l.amount -= amount;
        if (l.amount == 0) l.active = false;

        credits.safeTransferFrom(address(this), msg.sender, l.projectId, amount, "");

        _payout(l.seller, sellerProceeds);
        if (fee > 0) _payout(feeRecipient, fee);
        if (msg.value > total) _payout(msg.sender, msg.value - total);

        emit Sold(id, msg.sender, amount, total);
    }

    /// @dev Low-level ETH payout with failure revert. Used for seller
    ///      proceeds, fee transfers, and buyer refunds.
    function _payout(address to, uint256 value) internal {
        (bool ok, ) = to.call{value: value}("");
        if (!ok) revert TransferFailed();
    }
}
