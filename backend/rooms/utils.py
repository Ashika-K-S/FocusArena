import traceback
import types


def execute_python_code(code, test_cases):
    results = []

    try:
        local_scope = {}

        # Execute user code
        exec(code, {}, local_scope)

        # Find first function
        function = None
        for value in local_scope.values():
            if isinstance(value, types.FunctionType):
                function = value
                break

        if function is None:
            return {
                "status": "ERROR",
                "results": [{
                    "input": "",
                    "expected": "",
                    "got": "No function found",
                    "passed": False
                }]
            }

        overall_status = "CORRECT"

        for test in test_cases:
            try:
                raw_input = test.input_data.strip()
                expected_output = str(test.expected_output).strip()

                # Parse input safely
                try:
                    input_data = eval(raw_input)
                except:
                    input_data = raw_input

                # Execute function
                if isinstance(input_data, tuple):
                    result = function(*input_data)
                else:
                    result = function(input_data)

                result_str = str(result).strip()

                # Debug logs
                print("================================")
                print("INPUT:", repr(input_data))
                print("EXPECTED:", repr(expected_output))
                print("RESULT:", repr(result_str))
                print("================================")

                passed = result_str == expected_output

                if not passed:
                    overall_status = "WRONG"

                results.append({
                    "input": test.input_data,
                    "expected": expected_output,
                    "got": result_str,
                    "passed": passed
                })

            except Exception as e:
                overall_status = "ERROR"

                results.append({
                    "input": test.input_data,
                    "expected": str(test.expected_output),
                    "got": str(e),
                    "passed": False
                })

        return {
            "status": overall_status,
            "results": results
        }

    except Exception:
        return {
            "status": "ERROR",
            "results": [{
                "input": "",
                "expected": "",
                "got": traceback.format_exc(),
                "passed": False
            }]
        }