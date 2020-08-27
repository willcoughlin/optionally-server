declare module 'black-scholes' {
  export function blackScholes(s: number, k: number, t: number, v: number, r: number, callPut: 'call' | 'put');
}