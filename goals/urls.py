# goals/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('objectives/', views.ObjectiveListCreate.as_view(), name='objective-list-create'),
    path('objectives/<int:pk>/', views.ObjectiveDetail.as_view(), name='objective-detail'),

    # Adicione esta nova linha. A URL será, por exemplo, /api/goals/objectives/5/keyresults/
    # para criar um KR para o objetivo de ID 5.
    path('objectives/<int:objective_pk>/keyresults/', views.KeyResultCreate.as_view(), name='keyresult-create'),

    path('keyresults/<int:pk>/', views.KeyResultUpdate.as_view(), name='keyresult-update'),
]