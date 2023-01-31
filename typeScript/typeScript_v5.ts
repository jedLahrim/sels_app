// New typeScript Version 5 Features

//todo 1. ECMAScript 2021 support:
import { Any } from 'typeorm';

const obj: any = {};
// ECMAScript 2021 private fields
obj.privateField = 42;

//todo 2. Improved Type Inference:
let data = [1, 2, 3];
let inferredData: number[] = data;

//todo 3. Stricter Generics:
function reverse<T>(arr: T[], name: T): T[] {
  return arr.reverse();
}
let name = 'khalid';
const reversed = reverse([1, 2, 3, '', false], name);

//todo 4. BigInt support:
const bigIntValue = BigInt(Number.MAX_SAFE_INTEGER) * 281283761298123n;
console.log(bigIntValue); // output => 2533578885135196292768299459893n

//todo 5. Type-Only Imports and Exports:
// type-only export
export type Data = {
  name: string;
  age: number;
};
// type-only import '
// import type { Data } from './data';

//todo 6. Conditional Types with Mapped Types:
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type Data2 = { object: Data };
type UnpackedData = Unpacked<Data2>;

// todo fhadi ghanakhdo data type mn Data2  w ghankhchiwha f parameter_object
let parameter_object: UnpackedData = { object: { name: '', age: 2143 } };

// 7. Better Unions with Different Modifiers:
class PrivateClass {
  private name = 'Private';
  public getName() {
    return this.name;
  }
}

class PublicClass {
  public name = 'Public';
  public getName() {
    return this.name;
  }
}

type Class = PrivateClass | PublicClass;

const obj2: Class = new PublicClass();
console.log(obj2.getName());
