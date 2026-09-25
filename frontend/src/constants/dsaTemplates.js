export const DSA_TEMPLATES = {
  java: {
    name: "Java",
    monacoLang: "java",
    defaultCode: `// Java DSA Starter Template
import java.util.*;

public class Solution {
    // LeetCode-style algorithm method
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = sol.twoSum(nums, target);
        System.out.println("Result indices: " + Arrays.toString(result));
    }
}
`,
  },
  javascript: {
    name: "JavaScript",
    monacoLang: "javascript",
    defaultCode: `// JavaScript DSA Starter Template
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// Test case
const nums = [2, 7, 11, 15];
const target = 9;
console.log("Result indices:", twoSum(nums, target));
`,
  },
  cpp: {
    name: "C++",
    monacoLang: "cpp",
    defaultCode: `// C++ DSA Starter Template
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> ans = sol.twoSum(nums, target);
    cout << "Result: [" << ans[0] << ", " << ans[1] << "]" << endl;
    return 0;
}
`,
  },
  python: {
    name: "Python",
    monacoLang: "python",
    defaultCode: `# Python DSA Starter Template
from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []

if __name__ == "__main__":
    sol = Solution()
    print("Result indices:", sol.twoSum([2, 7, 11, 15], 9))
`,
  },
};
