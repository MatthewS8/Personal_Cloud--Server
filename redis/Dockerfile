FROM redis:latest

# Install gettext-base for envsubst and procps for sysctl
RUN apt-get update && apt-get install -y gettext-base && apt-get install -y procps

COPY redis.conf.template /usr/local/etc/redis/redis.conf.template

COPY start-redis.sh /usr/local/bin/start-redis.sh
RUN chmod +x /usr/local/bin/start-redis.sh

ENTRYPOINT ["/bin/sh", "/usr/local/bin/start-redis.sh"]
