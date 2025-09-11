# Usa uma imagem base oficial do .NET SDK 9.0 para o processo de build.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copia os arquivos de projeto (csproj) e restaura as dependências.
COPY *.csproj ./
RUN dotnet restore

# Copia todo o resto do código da sua aplicação.
COPY . .

# Publica a sua aplicação em modo Release.
RUN dotnet publish "back-tcc.csproj" -c Release -o /app/publish

# Usa uma imagem base oficial do .NET ASP.NET 9.0 para rodar a aplicação.
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Define a porta que a aplicação vai escutar, o Railway injeta a variável PORT.
ENV ASPNETCORE_URLS=http://+:$PORT

# Comando para iniciar a aplicação.
ENTRYPOINT ["dotnet", "back-tcc.dll"]