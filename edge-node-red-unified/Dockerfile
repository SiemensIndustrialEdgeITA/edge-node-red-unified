ARG NODE_RED_VERSION=latest
########################################################################################
FROM nodered/node-red:${NODE_RED_VERSION}-minimal as BASE

USER root

# install needed packages
RUN apk add --update-cache \
        cifs-utils \
        iputils \
    && rm -rf /var/cache/apk/*

# Copy package.json to the WORKDIR so npm builds all
# of your added nodes modules for Node-RED
COPY package.json .

# Copy OpenPipe Commmunication Nodes
COPY openpipe-nodes/ .

# copy custom settings and start script
COPY settings.js .
COPY start.sh .

########################################################################################
FROM BASE as BUILD

USER root

# Install devtools for building new nodes on minimal image
RUN apk add --no-cache --virtual buildtools build-base linux-headers udev python3 && \
    npm install --unsafe-perm --no-update-notifier --no-fund --only=production &&\
    chmod -R 777 .

########################################################################################
FROM BASE AS RELEASE

USER node-red

# copy builded node modules from BUILD
COPY --from=BUILD /usr/src/node-red/node_modules ./node_modules

# Clean up
RUN rm -rf /tmp/*

ENTRYPOINT ["/bin/sh", "start.sh"]