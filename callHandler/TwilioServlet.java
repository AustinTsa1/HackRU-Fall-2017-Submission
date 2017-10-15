import com.twilio.twiml.Gather;
import com.twilio.twiml.Method;
import com.twilio.twiml.Play;
import com.twilio.twiml.Say;
import com.twilio.twiml.TwiMLException;
import com.twilio.twiml.VoiceResponse;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;

public class TwilioServlet extends HttpServlet {

    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Create a dict of people we know.
        HashMap<String, String> callers = new HashMap<String, String>();
        callers.put("+14158675309", "Curious George");
        callers.put("+14158675310", "Boots");
        callers.put("+14158675311", "Virgil");

        String fromNumber = request.getParameter("From");
        String knownCaller = callers.get(fromNumber);
        String message;
        if (knownCaller == null) {
            // Use a generic message
            message = "Hello Monkey";
        } else {
            // Use the caller's name
            message = "Hello " + knownCaller;
        }

        // Create a TwiML response and add our friendly message.
        VoiceResponse twiml = new VoiceResponse.Builder()
                .say(new Say.Builder(message).build())
                // Play an MP3 for incoming callers.
                .play(new Play.Builder("http://demo.twilio.com/hellomonkey/monkey.mp3").build())
                .gather(new Gather.Builder()
                        .action("/handle-key")
                        .method(Method.POST)
                        .numDigits(1)
                        .say(new Say
                                .Builder("To speak to a real monkey, press 1. " +
                                        "Press 2 to record your own monkey howl. " +
                                        "Press any other key to start over.")
                                .build())
                        .build()
                )
                .build();

        response.setContentType("application/xml");
        try {
            response.getWriter().print(twiml.toXml());
        } catch (TwiMLException e) {
            e.printStackTrace();
        }
    }
}