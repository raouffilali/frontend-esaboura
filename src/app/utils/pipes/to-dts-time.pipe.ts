import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dstFormat'
})
export class DSTFormatPipe implements PipeTransform {
  constructor() {}
  transform(value: string): any {
    return value;
  }
}
