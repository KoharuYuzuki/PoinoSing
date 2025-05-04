export class Complex {
  constructor(
    public real: number,
    public imag: number,
  ) {}

  add(x: Complex): Complex {
    return new Complex(this.real + x.real, this.imag + x.imag)
  }

  subtract(x: Complex): Complex {
    return new Complex(this.real - x.real, this.imag - x.imag)
  }

  multiply(x: Complex): Complex {
    return new Complex(
      this.real * x.real - this.imag * x.imag,
      this.real * x.imag + this.imag * x.real,
    )
  }

  divide(x: Complex): Complex {
    const denominator = x.real * x.real + x.imag * x.imag
    return new Complex(
      (this.real * x.real + this.imag * x.imag) / denominator,
      (this.imag * x.real - this.real * x.imag) / denominator,
    )
  }

  magnitudeSquared(): number {
    return this.real * this.real + this.imag * this.imag
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared())
  }

  phase(): number {
    return Math.atan2(this.imag, this.real)
  }

  conjugate(): Complex {
    return new Complex(this.real, -this.imag)
  }

  scale(factor: number): Complex {
    return new Complex(this.real * factor, this.imag * factor)
  }

  toString(): string {
    if (this.imag >= 0) {
      return `${this.real} + ${this.imag}i`
    }
    return `${this.real} - ${Math.abs(this.imag)}i`
  }
}

function isPowerOfTwo(n: number): boolean {
  return (n & (n - 1)) === 0
}

function nextPowerOfTwo(n: number): number {
  let p = 1
  while (p < n) p <<= 1
  return p
}

function fft2x(input: Complex[]): Complex[] {
  const n = input.length

  if (n === 1) {
    return [input[0]!]
  }

  if (!isPowerOfTwo(n)) {
    throw new Error('FFT: input size must be a power of 2')
  }

  const even: Complex[] = []
  const odd: Complex[] = []

  for (let i = 0; i < n; i += 2) {
    even.push(input[i]!)
    odd.push(input[i + 1]!)
  }

  const evenFFT = fft2x(even)
  const oddFFT = fft2x(odd)

  const result: Complex[] = new Array(n)

  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n
    const twiddle = new Complex(Math.cos(angle), Math.sin(angle))
    const oddTerm = twiddle.multiply(oddFFT[k]!)

    result[k] = evenFFT[k]!.add(oddTerm)
    result[k + n / 2] = evenFFT[k]!.subtract(oddTerm)
  }

  return result
}

function ifft2x(input: Complex[]): Complex[] {
  const n = input.length
  const conjugated = input.map((x) => x.conjugate())
  const result = fft2x(conjugated)
  return result.map((x) => x.conjugate().divide(new Complex(n, 0)))
}

function rfft2x(input: number[]): Complex[] {
  const n = input.length
  const complexInput = input.map((x) => new Complex(x, 0))
  const result = fft2x(complexInput)
  return result.slice(0, Math.floor(n / 2) + 1)
}

function irfft2x(input: Complex[]): number[] {
  const n = (input.length - 1) * 2
  const fullSpectrum: Complex[] = new Array(n)
  for (let i = 0; i < input.length; i++) {
    fullSpectrum[i] = input[i]!
  }
  for (let i = 1; i < input.length - 1; i++) {
    fullSpectrum[n - i] = input[i]!.conjugate()
  }
  const result = ifft2x(fullSpectrum)
  return result.map((x) => x.real)
}

function bluesteinFFT(input: Complex[]): Complex[] {
  const n = input.length
  const m = nextPowerOfTwo(2 * n - 1)
  const a = [...new Array(m)].map(() => new Complex(0, 0))
  const b = [...new Array(m)].map(() => new Complex(0, 0))

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * i * i) / n
    const w = new Complex(Math.cos(angle), -Math.sin(angle))

    a[i] = input[i].multiply(w)
    b[i] = new Complex(Math.cos(angle), Math.sin(angle))
  }

  for (let i = n; i < m; i++) {
    a[i] = new Complex(0, 0)
    b[i] = new Complex(0, 0)
  }

  for (let i = 1; i < n; i++) {
    b[m - i] = b[i]
  }

  const A = fft2x(a)
  const B = fft2x(b)
  const C = A.map((v, i) => v.multiply(B[i]))
  const c = ifft2x(C)

  const output: Complex[] = new Array(n)

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * i * i) / n
    const w = new Complex(Math.cos(angle), -Math.sin(angle))

    output[i] = c[i].multiply(w)
  }

  return output
}

export function fft(input: Complex[]): Complex[] {
  return isPowerOfTwo(input.length) ? fft2x(input) : bluesteinFFT(input)
}

export function ifft(input: Complex[]): Complex[] {
  const n = input.length
  const conjInput = input.map((v) => v.conjugate())
  const y = fft(conjInput)
  return y.map((v) => v.conjugate().scale(1 / n))
}

export function rfft(input: number[]): Complex[] {
  const n = input.length
  if (isPowerOfTwo(n)) return rfft2x(input)
  const complexInput = input.map((v) => new Complex(v, 0))
  const spectrum = fft(complexInput)
  return spectrum.slice(0, Math.floor(n / 2) + 1)
}

export function irfft(input: Complex[]): number[] {
  const m = input.length
  const n = (m - 1) * 2
  if (isPowerOfTwo(n)) return irfft2x(input)
  const full: Complex[] = new Array(n)
  for (let i = 0; i < m; i++) {
    full[i] = input[i]!
  }
  for (let i = 1; i < m - 1; i++) {
    full[n - i] = input[i]!.conjugate()
  }
  const time = ifft(full)
  return time.map((v) => v.real)
}
