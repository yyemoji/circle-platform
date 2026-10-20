# Third-party services and notices

This independent implementation does not contain source code or proprietary assets from the referenced service.

- Tencent Cloud Live is an optional adapter and remains disabled until all required credentials and domains are supplied.
- MediaMTX is the default self-hosted live transport. See its upstream license in the deployed image.
- Payment defaults to a non-financial sandbox adapter. Production payment providers require a separate merchant agreement and credentials.
- MinIO-compatible storage may be configured for production; local storage is the default development implementation.

Credentials are supplied through environment variables, are redacted from structured logs, and are never returned by administration APIs.
