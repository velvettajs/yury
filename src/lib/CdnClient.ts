import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Cdn as Configuration, Bucket, CdnUrl } from './Configuration.js';
class Cdn {
	private s3Client: S3Client;
	public url: string;
	constructor(configuration: CdnOptions) {
		this.s3Client = new S3Client(configuration);
		this.url = CdnUrl;
	}
	public getCdn(): S3Client {
		return this.s3Client;
	}
	public async uploadToCdn(folder: string, filename: string, fileBuffer: Buffer, contentType: string): Promise<string> {
		try {
			const UploadParams = {
				Bucket,
				Key: `${folder}/${filename}`,
				Body: fileBuffer,
				ContentType: contentType
			};
			const command = new PutObjectCommand(UploadParams);
			await this.s3Client.send(command);
			return `${folder}/${filename}`;
		} catch (e) {
			console.log(e);
			throw new Error('Error uploading file');
		}
	}
}

export default new Cdn(Configuration);
