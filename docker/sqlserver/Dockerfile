ARG UBUNTU_VERSION=22.04

FROM ubuntu:${UBUNTU_VERSION}
ARG UBUNTU_VERSION

RUN echo 'Acquire::ForceIPv4 "true";' > /etc/apt/apt.conf.d/99force-ipv4

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    apt-transport-https

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update && apt-get install -y \
  curl apt-transport-https debconf-utils gnupg2 

RUN curl -fsSL "https://packages.microsoft.com/keys/microsoft.asc" | tee "/etc/apt/trusted.gpg.d/microsoft.asc"

RUN curl -fsSL "https://packages.microsoft.com/config/ubuntu/${UBUNTU_VERSION}/prod.list" | tee "/etc/apt/sources.list.d/msprod.list"

RUN curl -fsSL "https://packages.microsoft.com/config/ubuntu/${UBUNTU_VERSION}/mssql-server-2022.list" | tee "/etc/apt/sources.list.d/mssql-server-2022.list"

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt-get install -y \
    msodbcsql18 \
    mssql-tools18 \
    mssql-server

RUN apt-get -y install locales \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN locale-gen en_US.UTF-8

RUN update-locale LANG=en_US.UTF-8

# Create a config directory
RUN mkdir -p /usr/config
WORKDIR /usr/config

# Bundle config source
COPY ./sqlserver /usr/config

# Grant permissions for to our scripts to be executable
RUN chmod +x /usr/config/entrypoint.sh /usr/config/configure-db.sh

USER mssql

ENTRYPOINT ["./entrypoint.sh"]