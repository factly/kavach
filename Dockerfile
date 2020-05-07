FROM golang:1.14.2-alpine3.11
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
#RUN go build -o main .
EXPOSE ${PORT}
CMD ["go", "run", "main.go"]