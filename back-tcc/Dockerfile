# Usa uma imagem base oficial do .NET SDK 9.0 para o processo de build.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copia os arquivos de projeto (csproj) e restaura as depend�ncias.
COPY *.csproj ./
RUN dotnet restore

# Copia todo o resto do c�digo da sua aplica��o.
COPY . .

# Publica a sua aplica��o em modo Release.
RUN dotnet publish "back-tcc.csproj" -c Release -o /app/publish

# Usa uma imagem base oficial do .NET ASP.NET 9.0 para rodar a aplica��o.
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Define a porta que a aplica��o vai escutar, o Railway injeta a vari�vel PORT.
ENV ASPNETCORE_URLS=http://+:$PORT

# Comando para iniciar a aplica��o.
ENTRYPOINT ["dotnet", "back-tcc.dll"]