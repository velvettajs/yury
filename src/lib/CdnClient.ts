import { S3Client } from '@aws-sdk/client-s3';
import { Cdn as Configuration } from './Configuration';

class Cdn {
	private s3Client: S3Client;
	constructor(configuration: CdnOptions) {
		this.s3Client = new S3Client(configuration);
	}
	public getCdn(): S3Client {
		return this.s3Client;
	}
}

export default new Cdn(Configuration).getCdn();
