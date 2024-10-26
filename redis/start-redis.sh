#!/bin/sh
# Apply the memory overcommit setting
sysctl -w vm.overcommit_memory=1
# Use envsubst to substitute environment variables in the template
envsubst < /usr/local/etc/redis/redis.conf.template > /usr/local/etc/redis/redis.conf
# Start the Redis server
exec redis-server /usr/local/etc/redis/redis.conf
