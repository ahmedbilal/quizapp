from django.contrib import admin
from .models import Answer, Option, Question, Quiz, QuizInstance
import nested_admin
from django.db import models

class OptionInline(nested_admin.NestedStackedInline):
    model = Option
    max_num = 4

class QuestionInline(nested_admin.NestedStackedInline):
    model = Question
    inlines = [
        OptionInline
    ]
    extra = 0

@admin.register(Quiz)
class QuizAdmin(nested_admin.NestedModelAdmin):
    inlines = [
        QuestionInline
    ]

admin.site.register(QuizInstance)
# admin.site.register(Option)
admin.site.register(Answer)