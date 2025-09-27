package jp.co.monocrea.util;

public class StringUtil {

    private String inputString;

    public String getInputString() {
        return inputString;
    }

    public void setInputString(String inputString) {
        this.inputString = inputString;
    }

    public boolean isNullorEmpty(String inputString) {
        return (inputString == null || inputString.isEmpty());
    }
}
