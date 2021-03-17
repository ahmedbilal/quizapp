from django.db import models
from django.db.models import Q, F
from django.db.models.signals import pre_save
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model


class Quiz(models.Model):
    title = models.CharField(max_length=1024)
    max_allowed_time = models.DurationField(help_text="hh:mm:ss")

    def __str__(self):
        return f"{self.title} Quiz"

    class Meta:
        verbose_name_plural = "Quizzes"


class Question(models.Model):
    body = models.TextField() # should be html
    explanation = models.TextField() # should be html
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")

    @property
    def next_question(self):
        return getattr(Question.objects.filter(Q(id__gt=self.id) & Q(quiz=self.quiz)).first(), 'id', None)

    def __str__(self):
        return self.body


class Option(models.Model):
    body = models.TextField() # should be html
    correct = models.BooleanField()
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")

    def __str__(self):
        return self.body


class QuizInstance(models.Model):
    start_time = models.DateTimeField(auto_now_add=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    def is_ended(self):
        return timezone.now() > self.start_time + self.quiz.max_allowed_time


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE)
    quiz_instance = models.ForeignKey(QuizInstance, on_delete=models.CASCADE, related_name="answers")
    correct = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["question", "quiz_instance"], name="unique_question_quiz")
        ]

    def save(self, *args, **kwargs):
        correct_option = self.question.options.get(correct=True)
        self.correct = self.selected_option == correct_option
        super().save(*args, **kwargs)

def answer_pre_save(instance, **kwargs):
    answer = instance
    if answer.quiz_instance.is_ended():
        raise ValidationError("Quiz already ended")
    if answer.question != answer.selected_option.question:
        raise ValidationError("Selected option isn't valid")
    if answer.quiz_instance.quiz != answer.question.quiz:
        raise ValidationError("Question whose answer is given must be from same quiz as quiz instance")

pre_save.connect(answer_pre_save, sender=Answer)