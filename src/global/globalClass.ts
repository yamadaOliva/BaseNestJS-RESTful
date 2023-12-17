export class ResponseClass<D> {
  data: D | D[];
  EC: number;
  message: string;

  constructor(data: D | D[], EC: number, messsage: string) {
    this.data = data;
    this.EC = EC;
    this.message = messsage;
  }
}
