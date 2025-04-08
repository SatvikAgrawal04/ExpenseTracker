using System.ComponentModel.DataAnnotations;

namespace ExpenseTrackerAPI.Models
{
    public class ResetPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Otp { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }
}