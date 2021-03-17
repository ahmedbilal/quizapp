from rest_framework import serializers
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Quiz, Question, QuizInstance, Answer


class QuestionSerializer(serializers.HyperlinkedModelSerializer):
    options = serializers.SerializerMethodField()
    # options = serializers.StringRelatedField(read_only=True, many=True)
    id = serializers.ReadOnlyField()

    def get_options(self, obj):
        return [
            {
                'id': option.id,
                'body': option.body
            }
            for option in Question.objects.get(id=obj.id).options.all()
        ]

    class Meta:
        model = Question
        fields = "__all__"


class QuizSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    questions = serializers.SerializerMethodField()

    def get_questions(self, obj):
        return [
            {
                'id': question.id,
                'url': reverse("question-detail", args=(question.id,)),
                'body': question.body
            }
            for question in Question.objects.filter(quiz=obj)
        ]

    class Meta:
        model = Quiz
        fields = "__all__"


class QuizInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizInstance
        fields = "__all__"

    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

class AnswerSerializer(serializers.ModelSerializer):
    def validate(self, data):
        if timezone.now() > data["quiz_instance"].start_time + data["quiz_instance"].quiz.max_allowed_time:
            raise serializers.ValidationError("Quiz already ended")
        return data

    class Meta:
        model = Answer
        fields = "__all__"
        read_only_fields = ["correct"]
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Answer.objects.all(),
                fields=("question", "quiz_instance"),
                message="You can attempt a question only once"
            )
        ]


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = get_user_model()
        fields = ["username", "password", "password2", "email"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Password 2 must be same as Password")
        if not data["email"]:
            raise serializers.ValidationError({"email": "This field may not be blank"})
        return data

    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        email = validated_data.pop("email")

        return get_user_model().objects.create_user(username=username, password=password, email=email)
