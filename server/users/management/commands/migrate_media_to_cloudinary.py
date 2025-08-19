from django.core.management.base import BaseCommand
from ...models import Brand, Category, Product
import cloudinary.uploader
import os
from django.conf import settings

class Command(BaseCommand):
    help = "Migrate local media files to Cloudinary"

    def handle(self, *args, **kwargs):
        models_with_images = [
            (Brand, ["image"]),
            (Category, ["image"]),
            (Product, ["image1", "image2", "image3"]),
        ]

        for model, fields in models_with_images:
            for obj in model.objects.all():
                for field in fields:
                    img_field = getattr(obj, field, None)
                    if img_field and img_field.name:
                        local_path = os.path.join(settings.BASE_DIR, "media", img_field.name)
                        if os.path.exists(local_path):
                            self.stdout.write(f"Uploading {local_path} to Cloudinary...")
                            res = cloudinary.uploader.upload(local_path, folder=field)
                            # Save the new Cloudinary URL
                            setattr(obj, field, res["secure_url"])
                            obj.save(update_fields=[field])
                        else:
                            self.stdout.write(self.style.WARNING(f"File not found: {local_path}"))
