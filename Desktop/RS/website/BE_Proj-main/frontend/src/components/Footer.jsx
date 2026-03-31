import React from "react";

const Footer = () => {
  return (
    <div>
      <footer class="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
        <div class="container mx-auto px-4 py-8">
          <div class="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p class="text-gray-500 dark:text-gray-400">
              © 2025 RozgarSetu. All rights reserved.
            </p>
            <div class="flex gap-6 mt-4 md:mt-0 text-gray-500 dark:text-gray-400">
              <a
                class="hover:text-primary transition-colors"
                href="pvt.html"
                data-i18n="privacy"
              >
                Privacy Policy
              </a>
              <a
                class="hover:text-primary transition-colors"
                href="RozgarSetu\terms.html"
                data-i18n="terms"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
