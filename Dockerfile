FROM node:10-alpine


# set working directory
RUN mkdir /src
WORKDIR /src 

# install and cache app dependencies
COPY . /src
RUN npm install --silent

# add `/usr/src/app/node_modules/.bin` to $PATH
# ENV PATH /src/node_modules/.bin:$PATH
ENV DISABLE_V8_COMPILE_CACHE 1

# Build the app 
# CMD ["npm" "run" "build"]
# CMD npm run build