using System.ComponentModel.DataAnnotations;

namespace ExpenseTrackerAPI.Models
{
    public class VerifyOtpDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Otp { get; set; }
    }
}