#!/usr/bin/env python3
"""
Backend API Testing for NovaTok Music
Tests the API endpoints defined in /app/app/api/[[...path]]/route.js
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_base_url():
    """Get the base URL from environment variables"""
    base_url = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
    return f"{base_url}/api"

def test_get_api_status():
    """Test GET /api endpoint - should return app status"""
    print("\n=== Testing GET /api endpoint ===")
    
    try:
        base_url = get_base_url()
        print(f"Testing URL: {base_url}")
        
        response = requests.get(base_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify expected fields
            expected_fields = ['status', 'app', 'version', 'mode']
            missing_fields = []
            
            for field in expected_fields:
                if field not in data:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"❌ FAIL: Missing fields: {missing_fields}")
                return False
            
            # Verify expected values
            if data.get('status') != 'ok':
                print(f"❌ FAIL: Expected status 'ok', got '{data.get('status')}'")
                return False
                
            if data.get('app') != 'NovaTok Music':
                print(f"❌ FAIL: Expected app 'NovaTok Music', got '{data.get('app')}'")
                return False
                
            if data.get('version') != '1.0.0':
                print(f"❌ FAIL: Expected version '1.0.0', got '{data.get('version')}'")
                return False
            
            # Mode should be 'guest' since no SUPABASE_URL is set
            if data.get('mode') != 'guest':
                print(f"❌ FAIL: Expected mode 'guest', got '{data.get('mode')}'")
                return False
            
            print("✅ PASS: GET /api endpoint working correctly")
            return True
            
        else:
            print(f"❌ FAIL: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request failed - {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Invalid JSON response - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False

def test_post_api():
    """Test POST /api endpoint - should return received: true"""
    print("\n=== Testing POST /api endpoint ===")
    
    try:
        base_url = get_base_url()
        print(f"Testing URL: {base_url}")
        
        # Test data to send
        test_data = {
            "test": "data",
            "message": "Hello from test",
            "number": 42
        }
        
        response = requests.post(
            base_url, 
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify expected response structure
            if 'received' not in data:
                print("❌ FAIL: Missing 'received' field in response")
                return False
                
            if data.get('received') != True:
                print(f"❌ FAIL: Expected received=true, got {data.get('received')}")
                return False
            
            # Verify that our test data was echoed back
            if 'data' not in data:
                print("❌ FAIL: Missing 'data' field in response")
                return False
                
            returned_data = data.get('data')
            if returned_data != test_data:
                print(f"❌ FAIL: Returned data doesn't match sent data")
                print(f"Sent: {test_data}")
                print(f"Returned: {returned_data}")
                return False
            
            print("✅ PASS: POST /api endpoint working correctly")
            return True
            
        else:
            print(f"❌ FAIL: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ FAIL: Request failed - {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAIL: Invalid JSON response - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False

def test_post_api_invalid_json():
    """Test POST /api endpoint with invalid JSON - should return 400 error"""
    print("\n=== Testing POST /api endpoint with invalid JSON ===")
    
    try:
        base_url = get_base_url()
        print(f"Testing URL: {base_url}")
        
        # Send invalid JSON (plain text)
        response = requests.post(
            base_url, 
            data="invalid json data",
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if 'error' in data:
                print("✅ PASS: POST /api correctly handles invalid JSON")
                return True
            else:
                print("❌ FAIL: Expected error field in 400 response")
                return False
                
        else:
            print(f"❌ FAIL: Expected status 400 for invalid JSON, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ FAIL: Unexpected error - {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("🚀 Starting NovaTok Music Backend API Tests")
    print("=" * 50)
    
    # Get base URL info
    base_url = get_base_url()
    print(f"Base API URL: {base_url}")
    
    # Run tests
    test_results = []
    
    test_results.append(("GET /api status", test_get_api_status()))
    test_results.append(("POST /api with JSON", test_post_api()))
    test_results.append(("POST /api invalid JSON", test_post_api_invalid_json()))
    
    # Summary
    print("\n" + "=" * 50)
    print("🏁 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend API tests PASSED!")
        return True
    else:
        print("⚠️  Some backend API tests FAILED!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)