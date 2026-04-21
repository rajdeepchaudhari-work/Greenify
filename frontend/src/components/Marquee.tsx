const items = [
  'Live on Sepolia',
  '1 token · 1 tonne CO₂e',
  'ERC-1155',
  'Open source · MIT',
  'Verified on Etherscan',
  'Burn-to-claim retirement',
  'No custody · No KYC',
  'Carbon credits · on-chain',
];

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y-[3px] border-ink bg-ink py-3">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-8 px-8">
            <span className="font-mono text-[0.8rem] font-bold uppercase tracking-[0.12em] text-cream">
              {item}
            </span>
            <span className="h-2 w-2 rotate-45 bg-yellow" />
          </span>
        ))}
      </div>
    </div>
  );
}
