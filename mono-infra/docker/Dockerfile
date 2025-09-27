FROM postgres:12.6

ENV POSTGRES_USER=a01 \
		POSTGRES_PASSWORD=1qaz2WSX \
		POSTGRES_DB=Mono_DB

ENV PGDATA /var/lib/postgresql/data/pg_data

RUN mkdir -p "$PGDATA" && chown -R postgres:postgres "$PGDATA" && chmod 777 "$PGDATA"

VOLUME /var/lib/postgresql/data/pg_data

ENV TZ Asia/Tokyo

# 初期化用DDLファイルをコピー
COPY ../ddl/USERMANAGEMENT.sql /docker-entrypoint-initdb.d/

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
		CMD pg_isready -U $POSTGRES_USER || exit 1

EXPOSE 5432
