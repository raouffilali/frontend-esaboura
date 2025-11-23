export function randomHash(len: number, charSetInput: string) {
  const charSet = charSetInput || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

export const ageFilter = [
  { from: 1, to: 100 },
  { from: 1, to: 5 },
  { from: 5, to: 11 },
  { from: 11, to: 16 },
  { from: 16, to: 18 },
  { from: 18, to: 25 },
  { from: 25, to: 40 },  
  { from: 40, to: 100 }
];
