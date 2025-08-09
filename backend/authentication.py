# backend/authentication.py
import jwt
from jwt import PyJWKClient
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions
from django.conf import settings

class Auth0Authentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()

        if not auth_header or auth_header[0].lower() != b'bearer':
            return None

        if len(auth_header) != 2:
            raise exceptions.AuthenticationFailed('Cabeçalho do token malformado.')

        token = auth_header[1]

        try:
            # Esta é a forma moderna e correta de validar
            jwks_url = f'https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json'
            jwks_client = PyJWKClient(jwks_url)

            # O cliente JWK busca a chave de assinatura correta a partir do token
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            # Agora, decodificamos o token usando a chave correta
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=settings.AUTH0_ALGORITHMS,
                audience=settings.AUTH0_API_AUDIENCE,
                issuer=f'https://{settings.AUTH0_DOMAIN}/'
            )
        except jwt.exceptions.PyJWTError as error:
            # Se houver qualquer erro com o token (expirado, inválido, etc.)
            raise exceptions.AuthenticationFailed(f'Token inválido: {error}')
        except Exception as e:
            # Para outros erros inesperados (ex: falha de rede ao buscar as chaves)
            raise exceptions.AuthenticationFailed(f'Erro ao validar o token: {e}')

        # O resto do código para encontrar/criar o utilizador continua o mesmo
        try:
            auth0_user_id = payload['sub']
            user, created = User.objects.get_or_create(username=auth0_user_id)

            if created:
                user.email = payload.get('email', '')
                user.save()

            return (user, token)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Erro ao processar o utilizador: {e}')