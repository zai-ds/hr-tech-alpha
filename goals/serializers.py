# goals/serializers.py
from rest_framework import serializers
from .models import Objective, KeyResult

# A CORREÇÃO ESTÁ AQUI:
# Removemos 'current_value' da lista de campos somente leitura
# para permitir que ele seja atualizado via requisições PATCH.
class KeyResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyResult
        fields = ['id', 'title', 'start_value', 'target_value', 'current_value', 'progress']
        # 'id' e 'progress' são calculados ou definidos pelo sistema, então continuam read_only.
        read_only_fields = ['id', 'progress']

class ObjectiveSerializer(serializers.ModelSerializer):
    key_results = KeyResultSerializer(many=True)
    progress = serializers.IntegerField(read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Objective
        fields = ['id', 'title', 'description', 'owner_username', 'created_at', 'progress', 'key_results']
        read_only_fields = ['owner_username', 'created_at', 'progress']

    def create(self, validated_data):
        key_results_data = validated_data.pop('key_results')
        objective = Objective.objects.create(**validated_data)
        for key_result_data in key_results_data:
            KeyResult.objects.create(objective=objective, **key_result_data)
        return objective