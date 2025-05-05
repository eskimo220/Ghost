# syntax=docker.io/docker/dockerfile:1

FROM ghost:5.115.1-alpine

ENV GHOST_INSTALL=/var/lib/ghost
ENV GHOST_CONTENT=/var/lib/ghost/content

# Custom package name of lexical editor
ENV KG_NODES=@tryghost/kg-default-nodes
ENV KG_HTML_RENDERER=@tryghost/kg-lexical-html-renderer

# Copy local package
COPY --chown=node:node ghost/core/.yalc ${GHOST_INSTALL}/current/.yalc

# Modify package.json to use local .yalc packages
RUN set -eux; \
    cd ${GHOST_INSTALL}/current && \
    gosu node sed -i 's/"@tryghost\/kg-default-nodes": "1\.4\.5"/"@tryghost\/kg-default-nodes": "file:.yalc\/@tryghost\/kg-default-nodes"/' package.json && \
    gosu node sed -i 's/"@tryghost\/kg-lexical-html-renderer": "1\.3\.5"/"@tryghost\/kg-lexical-html-renderer": "file:.yalc\/@tryghost\/kg-lexical-html-renderer"/' package.json;

# Add MIME type overrides
COPY --chown=node:node ghost/core/core/shared/config/overrides.json /var/lib/ghost/current/core/shared/config/overrides.json

# Install dependencies as node user
RUN set -eux; \
    cd ${GHOST_INSTALL}/current && \
	gosu node yarn --production && \
    # clean up the cache
    rm -rf ${GHOST_CONTENT}/adapters/storage/s3/node_modules; \
	gosu node yarn cache clean; \
	gosu node npm cache clean --force; \
	npm cache clean --force; \
	rm -rv /tmp/yarn*;

# Set permissions
RUN chown -R node:node /var/lib/ghost/content

EXPOSE 2368