// contact.js
// Contact form handling with Formspree integration

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return; // Exit if no form on page
    
    // Initialize Formspree
    const formspreeEndpoint = 'https://formspree.io/f/xqepldon'; // REPLACE THIS with your actual Formspree ID
    
    // Create notification container
    function createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = createNotificationContainer();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 300);
                }
            }, 5000);
        }
    }
    
    // Validation functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        if (!phone.trim()) return true; // Phone is optional
        const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
        return phoneRegex.test(phone);
    }
    
    // Add error to field
    function addFieldError(field, message) {
        // Remove existing error
        removeFieldError(field);
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.appendChild(errorElement);
        
        // Focus on first error
        if (!contactForm.querySelector('.field-error:first-child')) {
            field.focus({ preventScroll: true });
        }
    }
    
    // Remove error from field
    function removeFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Validate individual field
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Skip if field is empty and not required
        if (!value && !field.hasAttribute('required')) {
            removeFieldError(field);
            return true;
        }
        
        switch(field.type) {
            case 'email':
                if (!value) {
                    errorMessage = 'Email address is required';
                    isValid = false;
                } else if (!isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
                
            case 'tel':
                if (value && !isValidPhone(value)) {
                    errorMessage = 'Please enter a valid phone number';
                    isValid = false;
                }
                break;
                
            default:
                if (field.id === 'name' && !value) {
                    errorMessage = 'Full name is required';
                    isValid = false;
                } else if (field.id === 'subject' && !value) {
                    errorMessage = 'Subject is required';
                    isValid = false;
                } else if (field.id === 'message') {
                    if (!value) {
                        errorMessage = 'Message is required';
                        isValid = false;
                    } else if (value.length < 10) {
                        errorMessage = 'Message should be at least 10 characters';
                        isValid = false;
                    }
                }
        }
        
        if (!isValid) {
            addFieldError(field, errorMessage);
        } else {
            removeFieldError(field);
        }
        
        return isValid;
    }
    
    // Validate entire form
    function validateForm() {
        let isValid = true;
        
        const requiredFields = contactForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate optional phone if provided
        const phoneField = document.getElementById('phone');
        if (phoneField.value.trim() && !validateField(phoneField)) {
            isValid = false;
        }
        
        return isValid;
    }
    
    // Set loading state
    function setLoading(isLoading) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner"></span>
                Sending...
            `;
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    }
    
    // Real-time validation
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
        // Validate on blur
        field.addEventListener('blur', () => validateField(field));
        
        // Remove error on focus
        field.addEventListener('focus', () => removeFieldError(field));
        
        // Real-time validation for email and phone
        if (field.type === 'email' || field.type === 'tel') {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    validateField(this);
                } else {
                    removeFieldError(this);
                }
            });
        }
    });
    
    // Form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            showNotification('Please fix the errors in the form.', 'error');
            return;
        }
        
        // Set loading state
        setLoading(true);
        
        try {
            // Prepare form data
            const formData = new FormData(this);
            formData.append('_subject', `Portfolio Contact: ${document.getElementById('subject').value}`);
            formData.append('_replyto', document.getElementById('email').value);
            
            // Send to Formspree
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                showNotification('🎉 Message sent successfully! I\'ll respond within 24-48 hours.', 'success');
                contactForm.reset();
                
                // Track successful submission (optional)
                console.log('Contact form submitted successfully');
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('❌ Failed to send message. Please email me directly at <a href="mailto:sapoornajanani@gmail.com">sapoornajanani@gmail.com</a>.', 'error');
        } finally {
            setLoading(false);
        }
    });
});