"""
RAG-Powered Query Parser with Hindi Support
Extracts location, skills, wage, work_type from natural language queries
"""
import re
from typing import Dict, List, Optional

try:
    from deep_translator import GoogleTranslator
    TRANSLATOR_AVAILABLE = True
except ImportError:
    TRANSLATOR_AVAILABLE = False
    print("Warning: deep-translator not available. Translation will be limited.")


class QueryParser:
    def __init__(self):
        if TRANSLATOR_AVAILABLE:
            self.translator = GoogleTranslator(source='auto', target='en')
        else:
            self.translator = None
        
        # Location keywords (Hindi and English) — Pune + PCMC
        self.location_keywords = {
            'wakad': 'Wakad',
            'shivajinagar': 'Shivajinagar',
            'hinjewadi': 'Hinjewadi',
            'baner': 'Baner',
            'kothrud': 'Kothrud',
            'aundh': 'Aundh',
            'viman nagar': 'Viman Nagar',
            'hadapsar': 'Hadapsar',
            'pimpri': 'Pimpri',
            'chinchwad': 'Chinchwad',
            'bhosri': 'Bhosri',
            'dighi': 'Dighi',
            'chakan': 'Chakan',
            'nigdi': 'Nigdi',
            'akurdi': 'Akurdi',
            'dehu road': 'Dehu Road',
            'talawade': 'Talawade',
            'moshi': 'Moshi',
            'phugewadi': 'Phugewadi',
            'ravet': 'Ravet',
            'tathawade': 'Tathawade',
            'punawale': 'Punawale',
            'balewadi': 'Balewadi',
            'sus': 'Sus',
            'pashan': 'Pashan',
            'bavdhan': 'Bavdhan',
            'dhayari': 'Dhayari',
            'undri': 'Undri',
            'kondhwa': 'Kondhwa',
            'wanowrie': 'Wanowrie',
            'magarpatta': 'Magarpatta',
            'kharadi': 'Kharadi',
            'wagholi': 'Wagholi',
            'dhanori': 'Dhanori',
            'lohegaon': 'Lohegaon',
            'kalyani nagar': 'Kalyani Nagar',
            'koregaon park': 'Koregaon Park',
            'deccan': 'Deccan',
            'camp': 'Camp',
            'swargate': 'Swargate',
            'katraj': 'Katraj',
            'narhe': 'Narhe',
            'ambegaon': 'Ambegaon',
            'warje': 'Warje',
            'erandwane': 'Erandwane',
            'karve nagar': 'Karve Nagar',
            'market yard': 'Market Yard',
            'vishrantwadi': 'Vishrantwadi',
            'alandi': 'Alandi',
            'pradhikaran': 'Pradhikaran',
            'sangvi': 'Sangvi',
            'kasarwadi': 'Kasarwadi',
            'dapodi': 'Dapodi',
            'bopkhel': 'Bopkhel',
            # Pimple localities
            'pimple saudagar': 'Pimple Saudagar',
            'pimple nilakh': 'Pimple Nilakh',
            'pimple gurav': 'Pimple Gurav',
            'yerawada': 'Yerawada',
        }
        
        # Skill keywords (Expanded for Hindi/Hinglish)
        self.skill_keywords = {
            'cleaning': ['cleaning', 'clean', 'safai', 'सफाई', 'maid', 'मेड', 'jhaadu', 'pocha', 'broom'],
            'cooking': ['cooking', 'cook', 'khana', 'खाना', 'rasoi', 'रसोई', 'bannana', 'chef', 'halwai'],
            'laundry': ['laundry', 'washing', 'kapde', 'कपड़े', 'dhona', 'dhobi'],
            'driving': ['driving', 'driver', 'chalaana', 'चलाना', 'gaadi'],
            'plumbing': ['plumbing', 'plumber', 'nali', 'नली', 'paani', 'पानी', 'tap', 'nal'],
            'electrician': ['electrician', 'bijli', 'बिजली', 'wiring', 'light', 'current'],
            'babysitter': ['babysitter', 'nanny', 'bacha', 'बच्चा', 'caretaker', 'bachon ki dekhbhaal']
        }
        
        # Work type keywords
        self.work_type_keywords = {
            'part-time': ['part-time', 'part time', 'parttime', 'adhura', 'अधूरा', 'kam samay'],
            'full-time': ['full-time', 'full time', 'fulltime', 'pura', 'पूरा', 'din bhar']
        }
        
        # Landmark synonyms for Hinglish
        self.landmark_triggers = ['paas', 'ke paas', 'near', 'at', 'mein', 'side']
    
    def detect_language(self, query: str) -> str:
        """Detect if query is in Hindi or English"""
        if self._is_hindi(query):
            return 'hi'
        return 'en'
    
    def parse(self, query: str) -> Dict:
        """
        Parse natural language query to structured format with real-time translation
        """
        query_text = query.strip()
        is_hindi = self._is_hindi(query_text)
        is_hinglish = self._is_hinglish(query_text)
        
        # 1. Manual Hinglish -> English normalization (Always do this first as it's very reliable)
        normalized_query = query_text.lower()
        manual_map = {
            'ke pass': 'near',
            'ke paas': 'near',
            'ke bagal mein': 'near',
            'chahiye': 'need',
            'chaiye': 'need',
            'zaroorat': 'need',
            'kaam': 'work',
            'mein': 'in',
            'dhoondo': 'find',
            'dhundo': 'find'
        }
        for hing, eng in manual_map.items():
            normalized_query = normalized_query.replace(hing, eng)
            
        translated_query = normalized_query
        
        # 2. Attempt Real-time translation for complex parts
        if (is_hindi or is_hinglish) and self.translator:
            try:
                # We use the normalized version to help the translator
                result_translated = self.translator.translate(normalized_query)
                if result_translated and result_translated.lower() != normalized_query:
                    translated_query = result_translated.lower()
                    # Preserve the 'near' keyword if it was lost in translation
                    if 'near' not in translated_query and 'near' in normalized_query:
                        translated_query = translated_query.replace('close to', 'near').replace('at', 'near')
            except Exception as e:
                # Fallback to manual normalization if API fails
                translated_query = normalized_query
        
        result = {
            'location': None,
            'address': None,
            'skills': [],
            'wage_max': None,
            'work_type': None,
            'language': 'hi' if is_hindi or is_hinglish else 'en',
            'translated_query': translated_query
        }
        
        # 3. Extract from the TRANSLATED/NORMALIZED text
        result['address'] = self._extract_specific_address(translated_query)
        # Also try on the original query in case translation mangled the landmark
        if not result['address']:
            result['address'] = self._extract_specific_address(query_text)
        result['location'] = self._extract_location(translated_query, result['address'])
        # If address extraction removed the location suffix, also check original query
        if not result['location']:
            result['location'] = self._extract_location(query_text, result['address'])
        result['skills'] = self._extract_skills(translated_query)
        result['wage_max'] = self._extract_wage(translated_query)
        result['work_type'] = self._extract_work_type(translated_query)
        
        return result
    
    def _is_hinglish(self, text: str) -> bool:
        """Simple heuristic to detect Hinglish (Hindi in Latin script)"""
        # Common Hinglish words that don't exist in English
        hinglish_markers = [
            'chaiye', 'zaroorat', 'chahiye', 'kaam', 'wala', 'wali', 'paas', 'mein', 
            'hai', 'tha', 'raha', 'sakte', 'karo', 'karne', 'bhai', 'ko', 'hi', 'bhi',
            'ke', 'se', 'tha', 'ho', 'ab', 'kya', 'kaise', 'kab', 'yaha', 'waha'
        ]
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        return any(marker in words for marker in hinglish_markers)
    
    def _extract_specific_address(self, query: str) -> Optional[str]:
        """Extract specific landmark or address (e.g., 'near Priyadarshani School Bhosri')"""
        # Remove common filler words but NOT location words (Bhosri, Wakad etc.) — we want to preserve the full landmark
        clean_query = re.sub(
            r'\b(find|me|some|cooks|cook|maids|maid|drivers|driver|plumbers|plumber|electricians?|babysitters?|chaiye|zaroorat|chahiye)\b',
            '', query, flags=re.IGNORECASE
        ).strip()
        
        # English + Hinglish triggers (ordered by specificity)
        patterns = [
            r'near\s+to\s+(.+?)(?:\s*,|$)',
            r'near\s+(.+?)(?:\s*,|$)',
            r'close\s+to\s+(.+?)(?:\s*,|$)',
            r'around\s+(.+?)(?:\s*,|$)',
            r'opposite\s+to\s+(.+?)(?:\s*,|$)',
            r'opposite\s+(.+?)(?:\s*,|$)',
            r'next\s+to\s+(.+?)(?:\s*,|$)',
            r'at\s+(.+?)(?:\s*,|$)',
            r'(.+?)\s+ke\s+paas',
            r'(.+?)\s+paas',
            r'(.+?)\s+ke\s+bagal\s+mein'
        ]
        for pattern in patterns:
            match = re.search(pattern, clean_query.strip(), re.IGNORECASE)
            if match:
                addr = match.group(1).strip()
                # Only strip trailing India / phase qualifiers — keep area names like Bhosri
                addr = re.sub(r',?\s*india\s*$', '', addr, flags=re.IGNORECASE).strip()
                addr = re.sub(r',?\s*phase\s+\d+\s*$', '', addr, flags=re.IGNORECASE).strip()
                
                if len(addr) > 2 and addr.lower() not in ['pune', 'india', 'area', 'job', 'ke']:
                    return addr.title()
        return None
    
    def _is_hindi(self, text: str) -> bool:
        """Check if text contains Hindi characters"""
        hindi_pattern = re.compile(r'[\u0900-\u097F]')
        return bool(hindi_pattern.search(text))
    
    def _extract_location(self, query: str, address: Optional[str] = None) -> Optional[str]:
        """Extract location from query, with fallback to area embedded in the address"""
        query_lower = query.lower()
        for keyword, location in self.location_keywords.items():
            if keyword in query_lower:
                return location
        # Fallback: check if the extracted address itself ends with a known locality
        # e.g. "Priyadarshani School Bhosri" → location = "Bhosri"
        if address:
            addr_lower = address.lower()
            for keyword, location in self.location_keywords.items():
                if addr_lower.endswith(keyword) or f' {keyword}' in addr_lower:
                    return location
        return None
    
    def _extract_skills(self, query: str) -> List[str]:
        """Extract skills from query"""
        skills = []
        query_lower = query.lower()
        
        for skill, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    skills.append(skill)
                    break
        
        return skills
    
    def _extract_wage(self, query: str) -> Optional[int]:
        """Extract maximum wage from query"""
        # Look for patterns like "12k", "12000", "12 thousand"
        patterns = [
            r'(\d+)\s*k\b',  # 12k
            r'(\d+)\s*thousand',  # 12 thousand
            r'upto\s*(\d+)',  # upto 12000
            r'till\s*(\d+)',  # till 12000
            r'max\s*(\d+)',  # max 12000
            r'(\d{4,5})\b'  # 12000 (4-5 digits)
        ]
        
        for pattern in patterns:
            match = re.search(pattern, query.lower())
            if match:
                value = int(match.group(1))
                # If it's a small number (like 12), assume it's in thousands
                if value < 100:
                    value *= 1000
                return value
        
        return None
    
    def _extract_work_type(self, query: str) -> Optional[str]:
        """Extract work type from query"""
        query_lower = query.lower()
        for work_type, keywords in self.work_type_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    return work_type.capitalize()
        return None
