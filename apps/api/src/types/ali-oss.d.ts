declare module "ali-oss" {
  export type ClientOptions = {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  };

  export type Client = {
    delete(objectKey: string): Promise<unknown>;
  };

  export default class OSS implements Client {
    constructor(options: ClientOptions);
    delete(objectKey: string): Promise<unknown>;
  }
}
