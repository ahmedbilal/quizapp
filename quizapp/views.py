from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.db.models import Count, Q

from .models import Quiz, Question, QuizInstance, Answer
from .serializers import QuizSerializer, QuestionSerializer, QuizInstanceSerializer, AnswerSerializer, UserSerializer


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class QuizInstanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = QuizInstance.objects.all()
    serializer_class = QuizInstanceSerializer


class AnswerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

    def perform_create(self, serializer):
        return serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created_instance = self.perform_create(serializer)

        question = serializer.validated_data["question"]

        response = {
            "correct": created_instance.correct,
            "explanation": question.explanation,
            "next_question": question.next_question
        }
        headers = self.get_success_headers(serializer.data)

        return Response(response, status=status.HTTP_201_CREATED, headers=headers)


class ResultDetail(APIView):
    def get(self, request, quiz_instance=None, format=None):
        correct_answer_count = Count("answers__correct", filter=Q(answers__correct=True))
        incorrect_answer_count = Count("answers__correct", filter=Q(answers__correct=False))
        qs = (QuizInstance
                .objects
                .annotate(correct_answer_count=correct_answer_count)
                .annotate(incorrect_answer_count=incorrect_answer_count)
                .get(id=quiz_instance)
        )
        grade_percentage = int((qs.correct_answer_count / (qs.correct_answer_count + qs.incorrect_answer_count)) * 100)
        return Response({
            "result": {
                "grade_percentage": grade_percentage
            }
        })


class UserCreateView(CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = get_object_or_404(Token, user=request.user)
        token.delete()
        return Response({
            "message": "Logout successful"
        })