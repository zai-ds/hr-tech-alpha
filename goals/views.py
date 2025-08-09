from rest_framework import generics, permissions
from .models import Objective, KeyResult
from .serializers import ObjectiveSerializer, KeyResultSerializer

# Esta View lida com LISTAR todos os objetivos e CRIAR um novo objetivo.
class ObjectiveListCreate(generics.ListCreateAPIView):
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Objective.objects.filter(owner=self.request.user)

    # O perform_create agora só precisa adicionar o dono.
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Esta View lida com VER, ATUALIZAR e DELETAR um único objetivo.
class ObjectiveDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Também garantimos que o usuário só pode ver/editar/deletar seus próprios objetivos.
    def get_queryset(self):
        return Objective.objects.filter(owner=self.request.user)

# Esta View lida apenas com ATUALIZAR um KeyResult.
# É mais seguro, pois não queremos permitir que KRs sejam listados ou deletados separadamente.
class KeyResultUpdate(generics.UpdateAPIView):
    serializer_class = KeyResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    # O usuário só pode atualizar KRs de objetivos que lhe pertencem.
    def get_queryset(self):
        return KeyResult.objects.filter(objective__owner=self.request.user)
    
# Esta View lida apenas com a CRIAÇÃO de um novo KeyResult.
class KeyResultCreate(generics.CreateAPIView):
    serializer_class = KeyResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Este método garante que estamos criando um KR para um objetivo
    # que pertence ao usuário que está fazendo a requisição.
    def perform_create(self, serializer):
        # Pegamos o ID do objetivo a partir da URL
        objective_id = self.kwargs['objective_pk']
        # Buscamos o objeto Objective correspondente
        objective = Objective.objects.get(pk=objective_id, owner=self.request.user)
        # Salvamos o novo KR, associando-o ao objetivo correto
        serializer.save(objective=objective)
