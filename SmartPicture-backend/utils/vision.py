def analyze_image_uri(image_uri: str):
    from google.cloud import vision  # 延迟导入
    client = vision.ImageAnnotatorClient()
    image = vision.Image()
    image.source.image_uri = image_uri

    response = client.label_detection(image=image)
    return [label.description for label in response.label_annotations]

def detect_explicit_content(image_uri: str):
    from google.cloud import vision
    client = vision.ImageAnnotatorClient()
    image = vision.Image()
    image.source.image_uri = image_uri
    response = client.safe_search_detection(image=image)
    safe = response.safe_search_annotation
    return {"adult": safe.adult, "violence": safe.violence, "racy": safe.racy}
