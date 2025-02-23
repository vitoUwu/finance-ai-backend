# Autenticação na API Finance AI

A API utiliza autenticação via Google OAuth2 e retorna um token JWT para ser usado nas requisições subsequentes.

## Endpoint de Autenticação

```http
POST /sessions
```

### Request Body
```json
{
  "token": "google_id_token"
}
```

- `token`: Token ID obtido após autenticação com Google OAuth2

### Response (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "https://avatar-url.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token"
}
```

## Como Usar

1. **Frontend**: Implemente o login com Google usando a biblioteca oficial
```javascript
// Exemplo usando Google Sign-In
const googleUser = await google.signin();
const idToken = googleUser.getAuthResponse().id_token;
```

2. **Envie o token para a API**
```javascript
const response = await fetch('http://your-api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: idToken
  })
});

const { token } = await response.json();
```

3. **Use o JWT nas requisições**
```javascript
fetch('http://your-api/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Notas Importantes

- O token JWT expira em 7 dias
- Todas as rotas (exceto /sessions) requerem autenticação
- Em caso de token inválido ou expirado, a API retorna status 401
- O header de autorização deve seguir o formato: `Bearer <token>`

## Erros Comuns

### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Token is missing"
}
```

```json
{
  "status": "error",
  "message": "Invalid token"
}
```

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error"
}
```

## Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sign-In
4. Configure as credenciais OAuth2:
   - Tipo: Web application
   - Origens JavaScript autorizadas: seu domínio frontend
   - URIs de redirecionamento autorizados: seus endpoints de callback
5. Copie o Client ID e Client Secret
6. Configure as variáveis de ambiente:
   ```env
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret
   ```

## Segurança

- Sempre use HTTPS em produção
- Nunca compartilhe ou exponha o JWT
- Mantenha as credenciais do Google em variáveis de ambiente
- Implemente rate limiting em produção
- Monitore tentativas de autenticação suspeitas

