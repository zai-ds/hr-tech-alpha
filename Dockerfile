# --- Estágio 1: Build ---
# CORREÇÃO: 'AS' em maiúsculas para combinar com 'FROM'
FROM python:3.9-slim AS builder

# CORREÇÃO: Usando o formato chave=valor
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala as dependências do sistema
RUN apt-get update && apt-get install -y build-essential

# Copia e instala as dependências Python
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# --- Estágio 2: Final ---
FROM python:3.9-slim

# Cria usuário não-root
RUN useradd --create-home appuser
WORKDIR /home/appuser

# Copia as dependências pré-compiladas
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copia o código da aplicação
COPY . .

# NOVO PASSO: Roda o 'collectstatic' para juntar todos os arquivos de CSS/JS
# O 'chown' corrige as permissões para o nosso usuário não-root poder executar
RUN chown -R appuser:appuser /home/appuser && \
    python manage.py collectstatic --noinput

# Muda para o usuário não-root
USER appuser

# Expõe a porta
EXPOSE 8000

# Comando de início
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]