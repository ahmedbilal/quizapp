from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, QuizInstanceViewSet, AnswerViewSet, ResultDetail, UserCreateView, LogoutView
from django.views.generic import TemplateView
from rest_framework.authtoken.views import ObtainAuthToken

router = DefaultRouter()
router.register('quizzes', QuizViewSet)
router.register('questions', QuestionViewSet)
router.register('quizinstances', QuizInstanceViewSet)
router.register('answers', AnswerViewSet)

urlpatterns = [
    path('result/<int:quiz_instance>/', ResultDetail.as_view(), name='result'),
    path('', include(router.urls)),
    path('accounts/signup/', UserCreateView.as_view(), name='signup'),
    path('accounts/login/', ObtainAuthToken.as_view(), name='login'),
    path('accounts/logout/', LogoutView.as_view(), name='logout')
]