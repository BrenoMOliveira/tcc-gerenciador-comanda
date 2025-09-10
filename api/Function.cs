using System.Net;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Threading.Tasks;

public class Function
{
    public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, ILogger log)
    {
        log.LogInformation("C# HTTP trigger function processed a request.");
        return req.CreateResponse(HttpStatusCode.OK, "Hello from .NET on Vercel!");
    }
}

