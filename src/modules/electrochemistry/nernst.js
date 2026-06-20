/**
 * nernst.js — Electrochemistry calculation helpers
 *
 * All the maths lives here so components stay clean.
 * To change the cell type, update E_STANDARD and N_ELECTRONS.
 */

/** Standard cell potential for Zn/Cu Daniell cell (volts) */
export const E_STANDARD = 1.10

/** Electrons transferred per formula unit */
export const N_ELECTRONS = 2

/** Target voltage for the simulator puzzle */
export const TARGET_VOLTAGE = 1.15

/**
 * Calculate cell potential using the Nernst equation.
 *
 * E = E° − (0.0592 / n) × log₁₀(Q)
 * where Q = [Zn²⁺] / [Cu²⁺]
 *
 * @param {number} znConc  - Zinc ion concentration in mol/L
 * @param {number} cuConc  - Copper ion concentration in mol/L
 * @returns {number}       - Cell potential in volts
 */
export function calcEcell(znConc, cuConc) {
  const Q = znConc / cuConc
  return E_STANDARD - (0.0592 / N_ELECTRONS) * Math.log10(Q)
}

/**
 * Calculate the reaction quotient Q = [Zn²⁺] / [Cu²⁺]
 */
export function calcQ(znConc, cuConc) {
  return znConc / cuConc
}

/**
 * Calculate what Q value is needed to hit the target voltage.
 * Derived by rearranging the Nernst equation for Q.
 */
export function targetQ() {
  return Math.pow(10, (E_STANDARD - TARGET_VOLTAGE) * N_ELECTRONS / 0.0592)
}
