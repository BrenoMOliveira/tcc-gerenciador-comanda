using Microsoft.AspNetCore.Http;

namespace back_tcc.Extensions;

public static class HttpContextExtensions
{
	public static Guid? GetUserId(this HttpContext context)
	{
		var idClaim = context.User.FindFirst("id")?.Value;
		return Guid.TryParse(idClaim, out var id) ? id : null;
	}
}
