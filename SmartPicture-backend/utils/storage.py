def upload_to_gcs(bucket_name, source_file_name, destination_blob_name):
    from google.cloud import storage
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)
    return f"gs://{bucket_name}/{destination_blob_name}"

def generate_signed_url(bucket_name, blob_name, expiration=3600):
    from google.cloud import storage
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    return blob.generate_signed_url(version="v4", expiration=expiration, method="GET")
