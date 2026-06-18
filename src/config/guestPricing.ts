export const NEGOTIATED_GUEST_PRICES_FC = [1500, 1200, 1000] as const;
export const GUEST_BILLING_BLOCK = 10;
export const DEFAULT_GUEST_PRICE_FC = 1500;

export function calculateGuestBilling(guestCount: number, pricePerGuestFc: number) {
  const totalFc = guestCount * pricePerGuestFc;
  const completedBlocks = Math.floor(guestCount / GUEST_BILLING_BLOCK);
  const guestsInCurrentBlock = guestCount % GUEST_BILLING_BLOCK;
  const blockSize = GUEST_BILLING_BLOCK;
  const blockAmountFc = blockSize * pricePerGuestFc;

  return {
    guestCount,
    pricePerGuestFc,
    totalFc,
    billingBlockSize: blockSize,
    completedBlocks,
    blockTotalFc: completedBlocks * blockAmountFc,
    guestsInCurrentBlock,
    nextBlockAt: completedBlocks * blockSize + blockSize,
    displayLabel:
      guestCount === 0
        ? `0 invité / 0 FC`
        : `${guestCount} invité${guestCount > 1 ? 's' : ''} / ${totalFc.toLocaleString('fr-FR')} FC`,
    blockProgressLabel:
      guestCount === 0
        ? `${blockSize} invités / ${blockAmountFc.toLocaleString('fr-FR')} FC`
        : `${guestsInCurrentBlock || blockSize} / ${blockSize} invités · ${((guestsInCurrentBlock || blockSize) * pricePerGuestFc).toLocaleString('fr-FR')} / ${blockAmountFc.toLocaleString('fr-FR')} FC`,
  };
}
