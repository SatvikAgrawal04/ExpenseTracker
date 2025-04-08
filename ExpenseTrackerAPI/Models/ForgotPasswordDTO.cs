using System.ComponentModel.DataAnnotations;

namespace ExpenseTrackerAPI.Models
{
    public class ForgotPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}