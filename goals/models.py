from django.db import models
from django.contrib.auth.models import User

class Objective(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='objectives')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    @property
    def progress(self):
        key_results = self.key_results.all()
        if not key_results:
            return 0
        total_progress = sum(kr.progress for kr in key_results)
        return int(total_progress / len(key_results))

class KeyResult(models.Model):
    title = models.CharField(max_length=200)
    objective = models.ForeignKey(Objective, on_delete=models.CASCADE, related_name='key_results')
    start_value = models.IntegerField(default=0)
    target_value = models.IntegerField()
    current_value = models.IntegerField(default=0)

    def __str__(self):
        return self.title

    @property
    def progress(self):
        if self.target_value == self.start_value:
            return 100
        progress_fraction = (self.current_value - self.start_value) / (self.target_value - self.start_value)
        return int(max(0, min(progress_fraction * 100, 100)))