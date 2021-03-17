import json
import pprint
from copy import deepcopy
from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from freezegun import freeze_time
from rest_framework.test import APIClient, APIRequestFactory
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from quizapp.models import Answer, Option, Question, Quiz, QuizInstance
from quizapp.urls import urlpatterns
from quizapp.views import QuizViewSet

prettyprint = lambda *args, **kwargs: pprint.pprint(*args, **kwargs, width=140, indent=2)

class MyTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        # print(urlpatterns[0].url_patterns)
        super().setUpClass()
        cls.client = APIClient()
        cls.user = get_user_model().objects.create_user(username="root", password="admin", email="me@example.com")

        token, created = Token.objects.get_or_create(user=cls.user)
        cls.client_extra_kwargs = {
            'HTTP_AUTHORIZATION': 'Token ' + token.key
        }
        cls.quizzes = {
            'python': Quiz.objects.create(title="Python", max_allowed_time=timedelta(minutes=30)),
            'javascript': Quiz.objects.create(title="Javascript", max_allowed_time=timedelta(minutes=30))
        }
        cls.python_questions = [
            Question.objects.create(
                body="Which function is used to convert a string to integer?",
                quiz=cls.quizzes['python'],
                explanation="int() is used to convert a string to integer",
            ),
            Question.objects.create(
                body="Which function is used to apply same operation to every element in iterable",
                quiz=cls.quizzes["python"],
                explanation="map() is used to apply same operation to every element in iterable"
            )
        ]
        Option.objects.bulk_create(
            [
                Option(body="int()", correct=True, question=cls.python_questions[0]),
                Option(body="dec()", correct=False, question=cls.python_questions[0]),
                Option(body="bin()", correct=False, question=cls.python_questions[0]),
                Option(body="hex()", correct=False, question=cls.python_questions[0]),

                Option(body="filter()", correct=False, question=cls.python_questions[1]),
                Option(body="reduce()", correct=False, question=cls.python_questions[1]),
                Option(body="partial()", correct=False, question=cls.python_questions[1]),
                Option(body="map()", correct=True, question=cls.python_questions[1]),
            ]
        )
        cls.options = {
            'python_q1': cls.python_questions[0].options.all(),
            'python_q2': cls.python_questions[1].options.all(),
        }

    def create_quiz_instance(self, quiz_id):
        response = self.client.post(reverse("quizinstance-list"), data={"quiz": quiz_id}, **self.client_extra_kwargs)
        return response.json()

    def test_quiz_list(self):
        response = self.client.get(reverse("quiz-list"))
        quiz_list = response.json()
        for quiz in quiz_list:
            self.assertIn("id", quiz)
            self.assertIn("title", quiz)

    def test_quiz_detail(self):
        response = self.client.get(reverse("quiz-detail", args=(self.quizzes['python'].id, )))
        quiz_detail = response.json()
        self.assertIn("title", quiz_detail)
        self.assertIn("questions", quiz_detail)
        for question in quiz_detail["questions"]:
            self.assertIn("id", question)
            self.assertIn("body", question)

    def test_question_detail(self):
        response = self.client.get(reverse("question-detail", args=(self.python_questions[0].id,)))
        question_detail = response.json()
        self.assertIn("body", question_detail)
        self.assertIn("options", question_detail)

    def test_start_quiz(self):
        # To start a quiz, we need to create a quiz instance
        self.assertIn("id", self.create_quiz_instance(self.quizzes['python'].id))

    def test_submit_incorrect_answer(self):
        quiz_instance = self.create_quiz_instance(self.quizzes['python'].id)["id"]
        wrong_option = self.options['python_q1'][1].id
        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': wrong_option
            },
            **self.client_extra_kwargs
        )
        self.assertFalse(response.json()["correct"])

    def test_submit_correct_answer(self):
        quiz_instance = self.create_quiz_instance(self.quizzes['python'].id)["id"]
        correct_option = self.options['python_q1'][0].id
        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': correct_option
            },
            **self.client_extra_kwargs
        )
        self.assertTrue(response.json()["correct"])

    def test_submit_answer_multiple_times(self):
        quiz_instance = self.create_quiz_instance(self.quizzes['python'].id)["id"]
        correct_option, wrong_option = self.options['python_q1'][0].id, self.options['python_q1'][1].id
        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': wrong_option
            },
            **self.client_extra_kwargs
        )

        self.assertJSONEqual(response.content, {'correct': False, 'explanation': 'int() is used to convert a string to integer', 'next_question': 2})

        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': correct_option
            },
            **self.client_extra_kwargs
        )
        self.assertJSONEqual(response.content, {'non_field_errors': ['You can attempt a question only once']})

    def test_submit_complete_quiz(self):
        quiz_instance = self.create_quiz_instance(self.quizzes['python'].id)["id"]
        wrong_option = self.options['python_q1'][1].id
        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': wrong_option
            },
            **self.client_extra_kwargs
        )

        self.assertJSONEqual(response.content, {'correct': False, 'explanation': 'int() is used to convert a string to integer', 'next_question': 2})

        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[1].id,
                'quiz_instance': quiz_instance,
                'selected_option': self.options['python_q2'][3].id
            },
            **self.client_extra_kwargs
        )
        self.assertJSONEqual(response.content, {'correct': True, 'explanation': 'map() is used to apply same operation to every element in iterable', 'next_question': None})

    def test_submit_quiz_within_allowed_time(self):
        self.test_submit_complete_quiz()

    def test_submit_quiz_exceeding_allowed_time(self):
        quiz_instance = self.create_quiz_instance(self.quizzes['python'].id)["id"]
        wrong_option = self.options['python_q1'][1].id
        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': wrong_option
            },
            **self.client_extra_kwargs
        )

        self.assertJSONEqual(response.content, {'correct': False, 'explanation': 'int() is used to convert a string to integer', 'next_question': 2})

        with freeze_time(timezone.now() + timedelta(minutes=45)):
            response = self.client.post(
                reverse("answer-list"),
                data={
                    'question': self.python_questions[1].id,
                    'quiz_instance': quiz_instance,
                    'selected_option': self.options['python_q2'][3].id
                },
            **self.client_extra_kwargs
            )
            self.assertJSONEqual(response.content, {'non_field_errors': ['Quiz already ended']})

    def test_result_detail(self):
        quiz_instance = self.create_quiz_instance(self.quizzes['python'].id)["id"]
        wrong_option = self.options['python_q1'][1].id
        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[0].id,
                'quiz_instance': quiz_instance,
                'selected_option': wrong_option
            },
            **self.client_extra_kwargs
        )

        self.assertJSONEqual(response.content, {'correct': False, 'explanation': 'int() is used to convert a string to integer', 'next_question': 2})

        response = self.client.post(
            reverse("answer-list"),
            data={
                'question': self.python_questions[1].id,
                'quiz_instance': quiz_instance,
                'selected_option': self.options['python_q2'][3].id
            },
            **self.client_extra_kwargs
        )
        self.assertJSONEqual(response.content, {'correct': True, 'explanation': 'map() is used to apply same operation to every element in iterable', 'next_question': None})

        response = self.client.get(
            reverse("result", args=(quiz_instance,))
        )
        self.assertJSONEqual(response.content, {'result': {'grade_percentage': 50}})

    def test_signup(self):
        response = self.client.post(
            reverse("signup"),
            data={
                'username': 'meow',
                'password': 'admin',
                'password2': 'admin',
                'email': ''
            }
        )
        self.assertJSONEqual(response.content, {
            'email': ['This field may not be blank']
        })
        response = self.client.post(
            reverse("signup"),
            data={
                'username': 'meow',
                'password': 'admin',
                'password2': 'admin',
                'email': 'me@example.com'
            }
        )
        self.assertJSONEqual(response.content, {
            'username': 'meow',
            'email': 'me@example.com'
        })

    def test_login(self):
        response = self.client.post(
            reverse("signup"),
            data={
                'username': 'meow',
                'password': 'admin',
                'password2': 'admin',
                'email': 'me@example.com'
            }
        )
        self.assertJSONEqual(response.content, {
            'username': 'meow',
            'email': 'me@example.com'
        })

        response = self.client.post(
            reverse("login"),
            data={
                'username': 'meow',
                'password': 'meow'
            }
        )
        self.assertJSONEqual(response.content, {'non_field_errors': ['Unable to log in with provided credentials.']})

        response = self.client.post(
            reverse("login"),
            data={
                'username': 'meow',
                'password': 'admin'
            }
        )
        self.assertIn("token", response.json())

    def test_logout(self):
        response = self.client.post(
            reverse("logout"),
            **self.client_extra_kwargs
        )
        self.assertJSONEqual(response.content, {'message': 'Logout successful'})
        response = self.client.post(
            reverse("logout"),
            **self.client_extra_kwargs
        )
        self.assertJSONEqual(response.content, {'detail': 'Invalid token.'})
