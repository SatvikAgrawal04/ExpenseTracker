using ExpenseTrackerAPI.Data;
using ExpenseTrackerAPI.Models;
using ExpenseTrackerAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordResetController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;
        private readonly ExpenseTrackerContext _context;

        public PasswordResetController(
            IOtpService otpService,
            IEmailService emailService,
            ExpenseTrackerContext context)
        {
            _otpService = otpService;
            _emailService = emailService;
            _context = context;
        }
        [HttpPost("forgot")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO model)
        {

            var api = Environment.GetEnvironmentVariable("POSTMARK_TOKEN");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email.ToLower());
            if (user == null)
            {
                return Ok(new { message = "If the email is registered, you will receive an OTP." });

            }
            string otp = _otpService.GenerateOtp();

            await _otpService.StoreOtpAsync(model.Email, otp);

            bool emailSent = await _emailService.SendOtpEmailAsync(model.Email, otp);
            if (!emailSent)
            {
                return StatusCode(500, new { error = "Failed to send OTP email", });
            }
            return Ok(new { message = "If the email is registered, you will receive an OTP." });
        }
        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            bool isValid = await _otpService.VerifyOtpAsync(model.Email, model.Otp);
            if (!isValid)
            {
                return BadRequest(new { error = "Invalid or expired OTP" });
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }
            try
            {
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

                user.PasswordHash = hashedPassword;
                await _context.SaveChangesAsync();
                await _otpService.RemoveOtpAsync(model.Email);
                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while resetting the password", details = ex.Message });
            }
        }
    }
}